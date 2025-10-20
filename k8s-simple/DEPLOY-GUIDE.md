# 🚀 Quick Deploy Guide

Hướng dẫn deploy nhanh cho development environment.

## ⚡ TL;DR - Quick Commands

```bash
# 1. Setup prerequisites
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# 2. Update endpoints trong configmap.yaml và secret.yaml

# 3. Deploy
kubectl apply -f base/

# 4. Setup DNS
echo "127.0.0.1 api.lbs-dev.local" | sudo tee -a /etc/hosts

# 5. Test
curl http://api.lbs-dev.local/health
```

## 📋 Checklist

### ☑️ Trước khi deploy

- [ ] AWS RDS MySQL đã được tạo
- [ ] AWS ElastiCache Redis đã được tạo
- [ ] Đã lấy RDS endpoint
- [ ] Đã lấy ElastiCache endpoint
- [ ] Đã cập nhật `configmap.yaml` với endpoints
- [ ] Đã cập nhật `secret.yaml` với credentials
- [ ] Đã build và push Docker image
- [ ] Đã cập nhật image trong `deployment.yaml`
- [ ] Metrics Server đã được cài đặt
- [ ] NGINX Ingress Controller đã được cài đặt

### ☑️ Sau khi deploy

- [ ] Pods đang chạy: `kubectl get pods -n lbs-dev`
- [ ] Service available: `kubectl get svc -n lbs-dev`
- [ ] HPA active: `kubectl get hpa -n lbs-dev`
- [ ] Ingress created: `kubectl get ingress -n lbs-dev`
- [ ] DNS/hosts configured
- [ ] Application accessible qua Ingress

## 🎯 Deploy Commands

### 1. Install Prerequisites

```bash
# Metrics Server (cho HPA)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify Metrics Server
kubectl get deployment metrics-server -n kube-system
kubectl top nodes

# NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Verify Ingress Controller
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

### 2. Update Configuration

```bash
# Edit configmap.yaml
vim base/configmap.yaml
# Cập nhật DB_HOST và REDIS_URL

# Edit secret.yaml
vim base/secret.yaml
# Cập nhật DB_USERNAME, DB_PASSWORD, và các secrets khác
```

### 3. Deploy Application

```bash
# Apply tất cả manifests
kubectl apply -f base/

# Hoặc apply từng file
kubectl apply -f base/namespace.yaml
kubectl apply -f base/configmap.yaml
kubectl apply -f base/secret.yaml
kubectl apply -f base/deployment.yaml
kubectl apply -f base/service.yaml
kubectl apply -f base/hpa.yaml
kubectl apply -f base/ingress.yaml
```

### 4. Verify Deployment

```bash
# Check namespace
kubectl get ns lbs-dev

# Check all resources
kubectl get all -n lbs-dev

# Check configmap
kubectl get configmap -n lbs-dev
kubectl describe configmap app-config -n lbs-dev

# Check secret
kubectl get secret -n lbs-dev
kubectl describe secret app-secrets -n lbs-dev

# Check pods
kubectl get pods -n lbs-dev
kubectl describe pod -n lbs-dev

# Check service
kubectl get svc -n lbs-dev
kubectl describe svc lbs-service -n lbs-dev

# Check HPA
kubectl get hpa -n lbs-dev
kubectl describe hpa lbs-hpa -n lbs-dev

# Check ingress
kubectl get ingress -n lbs-dev
kubectl describe ingress lbs-ingress -n lbs-dev

# Check logs
kubectl logs -f deployment/lbs-app -n lbs-dev
```

### 5. Setup DNS/Hosts

```bash
# Option 1: Add to /etc/hosts (local testing)
echo "127.0.0.1 api.lbs-dev.local" | sudo tee -a /etc/hosts

# Option 2: Use Ingress Controller External IP
INGRESS_IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "$INGRESS_IP api.lbs-dev.local" | sudo tee -a /etc/hosts

# Verify
cat /etc/hosts | grep lbs-dev
```

### 6. Test Application

```bash
# Test health endpoint
curl http://api.lbs-dev.local/health

# Test API endpoint
curl http://api.lbs-dev.local/api/users

# Test với headers
curl -H "Content-Type: application/json" http://api.lbs-dev.local/api/users

# Test POST request
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  http://api.lbs-dev.local/api/auth/login

# Open in browser
open http://api.lbs-dev.local
```

## 🔧 Common Operations

### View Logs

```bash
# Follow logs
kubectl logs -f deployment/lbs-app -n lbs-dev

# Last 100 lines
kubectl logs --tail=100 deployment/lbs-app -n lbs-dev

# Logs from specific pod
kubectl logs POD_NAME -n lbs-dev

# Logs from init container
kubectl logs POD_NAME -c wait-for-rds -n lbs-dev
kubectl logs POD_NAME -c wait-for-redis -n lbs-dev
```

### Scale Manually

```bash
# Scale deployment
kubectl scale deployment lbs-app --replicas=3 -n lbs-dev

# Check scaling
kubectl get deployment lbs-app -n lbs-dev
kubectl get pods -n lbs-dev
```

### Update Configuration

```bash
# Update configmap
kubectl edit configmap app-config -n lbs-dev

# Update secret
kubectl edit secret app-secrets -n lbs-dev

# Restart pods to pick up changes
kubectl rollout restart deployment lbs-app -n lbs-dev

# Check rollout status
kubectl rollout status deployment lbs-app -n lbs-dev
```

### Update Image

```bash
# Set new image
kubectl set image deployment/lbs-app app=your-registry/location-based-service:v1.1.0 -n lbs-dev

# Check rollout
kubectl rollout status deployment lbs-app -n lbs-dev

# Rollback if needed
kubectl rollout undo deployment lbs-app -n lbs-dev
```

### Debug Pod

```bash
# Exec into pod
kubectl exec -it deployment/lbs-app -n lbs-dev -- sh

# Inside pod, test connections
nc -zv DB_HOST 3306
nc -zv REDIS_HOST 6379

# Check environment variables
env | grep DB
env | grep REDIS
```

### View Metrics (HPA)

```bash
# Current HPA status
kubectl get hpa lbs-hpa -n lbs-dev

# Watch HPA (auto-refresh)
kubectl get hpa lbs-hpa -n lbs-dev --watch

# Describe HPA (detailed info)
kubectl describe hpa lbs-hpa -n lbs-dev

# View pod metrics
kubectl top pods -n lbs-dev

# View node metrics
kubectl top nodes
```

### Test Autoscaling

```bash
# Install load testing tool
# Mac: brew install hey
# Linux: apt-get install hey

# Generate load
hey -z 2m -c 50 -q 10 http://api.lbs-dev.local/api/users

# In another terminal, watch HPA
kubectl get hpa lbs-hpa -n lbs-dev --watch

# Watch pods being created
kubectl get pods -n lbs-dev --watch
```

## 🧹 Cleanup

```bash
# Delete all resources
kubectl delete -f base/

# Or delete namespace (deletes everything inside)
kubectl delete namespace lbs-dev

# Verify deletion
kubectl get all -n lbs-dev
```

## ❌ Troubleshooting

### Pods not starting?

```bash
kubectl describe pod POD_NAME -n lbs-dev
kubectl logs POD_NAME -n lbs-dev
kubectl get events -n lbs-dev --sort-by='.lastTimestamp'
```

### HPA not working?

```bash
# Check Metrics Server
kubectl get deployment metrics-server -n kube-system
kubectl logs -n kube-system deployment/metrics-server

# Check metrics available
kubectl top nodes
kubectl top pods -n lbs-dev

# Check HPA details
kubectl describe hpa lbs-hpa -n lbs-dev
```

### Ingress not working?

```bash
# Check Ingress Controller
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

# Check Ingress
kubectl describe ingress lbs-ingress -n lbs-dev

# Check DNS
nslookup api.lbs-dev.local
ping api.lbs-dev.local

# Port forward to test (bypass Ingress)
kubectl port-forward svc/lbs-service 3000:80 -n lbs-dev
curl http://localhost:3000/health
```

### Can't connect to RDS/Redis?

```bash
# Check security groups
# RDS security group phải allow traffic từ EKS nodes
# ElastiCache security group phải allow traffic từ EKS nodes

# Check endpoints trong configmap
kubectl get configmap app-config -n lbs-dev -o yaml | grep -A 5 "DB_HOST\|REDIS_URL"

# Test from pod
kubectl exec -it deployment/lbs-app -n lbs-dev -- sh
nc -zv YOUR_RDS_ENDPOINT 3306
nc -zv YOUR_REDIS_ENDPOINT 6379
```

## 📊 Useful Commands

```bash
# Get all resources in namespace
kubectl get all -n lbs-dev

# Get all resources with labels
kubectl get all -n lbs-dev -l app=location-based-service

# Get resource YAML
kubectl get deployment lbs-app -n lbs-dev -o yaml

# Describe resource
kubectl describe deployment lbs-app -n lbs-dev

# Watch resources
kubectl get pods -n lbs-dev --watch

# Get events
kubectl get events -n lbs-dev --sort-by='.lastTimestamp'

# Get resource usage
kubectl top pods -n lbs-dev
kubectl top nodes
```

---

**Happy Deploying! 🎉**
