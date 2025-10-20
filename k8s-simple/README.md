# 🚀 Kubernetes Manifests - Simple Version (Development)

Bộ Kubernetes manifests đơn giản cho môi trường development với giải thích chi tiết từng dòng code.

## 📁 Cấu trúc thư mục

```
k8s-simple/
├── base/                    # Base manifests
│   ├── namespace.yaml      # Namespace cho app
│   ├── configmap.yaml      # Configuration không nhạy cảm
│   ├── secret.yaml         # Credentials và sensitive data
│   ├── deployment.yaml     # Application deployment
│   ├── service.yaml        # Service để expose pods
│   ├── hpa.yaml            # Horizontal Pod Autoscaler
│   └── ingress.yaml        # Ingress routing
└── README.md               # Documentation này
```

## 📋 Prerequisites

1. ✅ AWS Account with permissions to create RDS, ElastiCache, and ALB
2. ✅ Kubernetes cluster (EKS recommended for ALB support)
3. ✅ `kubectl` installed and configured
4. ✅ Docker for building images
5. ✅ AWS Load Balancer Controller (for AWS ALB Ingress)
6. ✅ Metrics Server (for HPA)
7. ✅ `helm` (for installing AWS Load Balancer Controller)

## 🎯 Các bước triển khai

### Bước 1: Tạo AWS RDS MySQL

```bash
# Tạo RDS instance
aws rds create-db-instance \
  --db-instance-identifier dev-lbs-mysql \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0.35 \
  --master-username admin \
  --master-user-password DevPass123! \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-YOUR_SG_ID \
  --db-subnet-group-name your-subnet-group \
  --backup-retention-period 1 \
  --no-multi-az \
  --publicly-accessible

# Chờ RDS ready, sau đó lấy endpoint
aws rds describe-db-instances \
  --db-instance-identifier dev-lbs-mysql \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

### Bước 2: Tạo AWS ElastiCache Redis

```bash
# Tạo ElastiCache cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id dev-lbs-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --cache-subnet-group-name your-redis-subnet-group \
  --security-group-ids sg-YOUR_REDIS_SG

# Chờ ElastiCache ready, sau đó lấy endpoint
aws elasticache describe-cache-clusters \
  --cache-cluster-id dev-lbs-redis \
  --show-cache-node-info \
  --query 'CacheClusters[0].CacheNodes[0].Endpoint.Address' \
  --output text
```

### Bước 3: Cập nhật ConfigMap

Mở file `base/configmap.yaml` và cập nhật:

```yaml
# Line 25-26: Cập nhật RDS endpoint
DB_HOST: "dev-lbs-mysql.xxxxxxxxx.us-east-1.rds.amazonaws.com"

# Line 36-37: Cập nhật ElastiCache endpoint
REDIS_URL: "redis://dev-lbs-redis.xxxxxx.cache.amazonaws.com:6379"
```

### Bước 4: Cập nhật Secret

**Encode credentials:**
```bash
# Encode username
echo -n "admin" | base64
# Output: YWRtaW4=

# Encode password
echo -n "DevPass123!" | base64
# Output: RGV2UGFzczEyMyE=

# Encode JWT secret (tạo random string)
echo -n "$(openssl rand -base64 32)" | base64
```

Mở file `base/secret.yaml` và cập nhật các giá trị encoded.

### Bước 5: Build và Push Docker Image

```bash
# Build image
cd ../../app-nestjs
docker build -t your-registry/location-based-service:dev-latest .

# Push image (nếu dùng registry)
docker push your-registry/location-based-service:dev-latest

# Hoặc load vào local cluster
# minikube image load your-registry/location-based-service:dev-latest
```

### Bước 6: Cập nhật Deployment Image

Mở file `base/deployment.yaml` và cập nhật line 96:

```yaml
image: your-registry/location-based-service:dev-latest
```

### Bước 7: Cài đặt Prerequisites trong Cluster

#### Cài đặt Metrics Server (cho HPA)

```bash
# Install Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Kiểm tra Metrics Server
kubectl get deployment metrics-server -n kube-system

# Test metrics
kubectl top nodes
kubectl top pods -n lbs-dev
```

#### Install AWS Load Balancer Controller (for ALB)

```bash
# Prerequisites: EKS cluster with OIDC provider
# Create IAM OIDC provider for your EKS cluster
eksctl utils associate-iam-oidc-provider \
  --region us-east-1 \
  --cluster your-cluster-name \
  --approve

# Download IAM policy document
curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.6.2/docs/install/iam_policy.json

# Create IAM policy
aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json

# Create IAM service account
eksctl create iamserviceaccount \
  --cluster=your-cluster-name \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --attach-policy-arn=arn:aws:iam::ACCOUNT_ID:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve

# Install AWS Load Balancer Controller using Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=your-cluster-name \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

# Verify installation
kubectl get deployment -n kube-system aws-load-balancer-controller
kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
```

### Bước 8: Deploy lên Kubernetes

```bash
# Apply tất cả manifests
cd ../k8s-simple
kubectl apply -f base/

# Kiểm tra deployment
kubectl get all -n lbs-dev
```

### Bước 9: Configure DNS for AWS ALB

```bash
# Get ALB DNS name (after Ingress is created)
ALB_DNS=$(kubectl get ingress lbs-ingress -n lbs-dev -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "ALB DNS: $ALB_DNS"

# Example output:
# k8s-lbsdev-lbsingre-xxxxxxxxxx-123456789.us-east-1.elb.amazonaws.com

# Option 1: Test directly with ALB DNS
curl http://$ALB_DNS/health

# Option 2: Configure DNS CNAME record
# In your DNS provider (Route53, Cloudflare, etc.):
# Create CNAME: api.lbs-dev.local → k8s-lbsdev-lbsingre-xxxxxxxxxx-123456789.us-east-1.elb.amazonaws.com

# Option 3: For local testing, add to /etc/hosts (not recommended for ALB)
# Get ALB IP (ALB uses multiple IPs, this is just for testing)
# nslookup $ALB_DNS
# echo "<ALB_IP> api.lbs-dev.local" | sudo tee -a /etc/hosts
```

## ✅ Verify Deployment

```bash
# Kiểm tra pods
kubectl get pods -n lbs-dev

# Xem logs
kubectl logs -f deployment/lbs-app -n lbs-dev

# Kiểm tra service
kubectl get svc -n lbs-dev

# Kiểm tra HPA
kubectl get hpa -n lbs-dev

# Kiểm tra Ingress
kubectl get ingress -n lbs-dev
```

### Test Application

#### Option 1: Via AWS ALB (recommended)

```bash
# Get ALB DNS name
ALB_DNS=$(kubectl get ingress lbs-ingress -n lbs-dev -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Test with curl using ALB DNS directly
curl http://$ALB_DNS/health
curl http://$ALB_DNS/api/users

# Test with host header (if DNS not configured)
curl -H "Host: api.lbs-dev.local" http://$ALB_DNS/health

# If DNS is configured
curl http://api.lbs-dev.local/health
open http://api.lbs-dev.local
```

#### Option 2: Port Forward (nếu Ingress chưa setup)

```bash
# Port forward service
kubectl port-forward svc/lbs-service 3000:80 -n lbs-dev

# Truy cập
open http://localhost:3000
```

### Test HPA (Autoscaling)

```bash
# Xem current metrics
kubectl get hpa lbs-hpa -n lbs-dev

# Xem chi tiết HPA
kubectl describe hpa lbs-hpa -n lbs-dev

# Test autoscaling với load
# Install hey tool: brew install hey (Mac) hoặc apt install hey (Linux)
hey -z 2m -c 50 http://api.lbs-dev.local/api/users

# Watch HPA trong terminal khác
kubectl get hpa lbs-hpa -n lbs-dev --watch
```

## 📖 Giải thích chi tiết các files

### 1. `namespace.yaml` - Namespace

**Mục đích:** Tạo không gian tên riêng cho app, giúp tổ chức và phân tách resources.

**Các khái niệm:**
- `apiVersion: v1`: Version của Kubernetes API cho resource này
- `kind: Namespace`: Loại resource
- `metadata.name`: Tên namespace (lbs-dev)
- `labels`: Key-value pairs để organize resources

### 2. `configmap.yaml` - Configuration Map

**Mục đích:** Lưu trữ configuration không nhạy cảm (endpoints, ports, settings).

**Các khái niệm:**
- `data`: Key-value pairs của configuration
- ConfigMap được inject vào pods qua environment variables
- Có thể update ConfigMap mà không cần rebuild image

**Các config quan trọng:**
- `DB_HOST`: RDS endpoint
- `REDIS_URL`: ElastiCache endpoint
- `NODE_ENV`: Môi trường runtime
- `RUN_SEEDER`: Chạy seeder hay không

### 3. `secret.yaml` - Secrets

**Mục đích:** Lưu trữ thông tin nhạy cảm (passwords, tokens, keys).

**Các khái niệm:**
- `type: Opaque`: Loại secret phổ biến nhất
- Dữ liệu được encode base64 (không phải encryption)
- Kubernetes có thể encrypt secrets at rest

**Các secret quan trọng:**
- `DB_USERNAME`, `DB_PASSWORD`: RDS credentials
- `JWT_SECRET_KEY`: Key để sign JWT tokens
- `EMAIL_USER_NAME`, `EMAIL_PASSWORD`: Email credentials

### 4. `deployment.yaml` - Application Deployment

**Mục đích:** Quản lý việc deploy và scale application pods.

**Các phần quan trọng:**

#### a. Replicas
```yaml
replicas: 1
```
Số lượng pods chạy song song. Dev: 1 pod là đủ.

#### b. Selector
```yaml
selector:
  matchLabels:
    app: location-based-service
```
Xác định pods nào thuộc về deployment này.

#### c. Init Containers
```yaml
initContainers:
  - name: wait-for-rds
  - name: wait-for-redis
```
Chạy trước main container để:
- Check RDS MySQL connectivity
- Check ElastiCache Redis connectivity
- Đảm bảo dependencies sẵn sàng trước khi app start

#### d. Main Container
```yaml
containers:
  - name: app
    image: your-registry/location-based-service:dev-latest
```
Container chính chạy ứng dụng NestJS.

#### e. Environment Variables
```yaml
env:
  - name: DB_HOST
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: DB_HOST
```
Inject config từ ConfigMap và Secret vào container.

#### f. Resource Limits
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```
- `requests`: Tài nguyên tối thiểu cần thiết
- `limits`: Tài nguyên tối đa có thể sử dụng

#### g. Health Checks
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
```
- `livenessProbe`: Check container còn sống không (fail → restart)
- `readinessProbe`: Check container sẵn sàng nhận traffic không (fail → remove khỏi service)

### 5. `service.yaml` - Service

**Mục đích:** Expose pods ra ngoài với stable IP/DNS.

**Các khái niệm:**
- `type: ClusterIP`: Service chỉ accessible trong cluster
- `selector`: Chọn pods để route traffic
- `port: 80`: Port external (trong cluster)
- `targetPort: 3000`: Port của container

**Traffic flow:**
```
Request → Service (port 80) → Pod (port 3000) → App
```

### 6. `hpa.yaml` - Horizontal Pod Autoscaler

**Mục đích:** Tự động scale số lượng pods dựa trên CPU/Memory usage.

**Các khái niệm:**

#### a. Min/Max Replicas
```yaml
minReplicas: 1
maxReplicas: 3
```
- `minReplicas`: Số pods tối thiểu (1 cho dev)
- `maxReplicas`: Số pods tối đa (3 cho dev)

#### b. Metrics
```yaml
metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```
- Scale up khi CPU usage > 70%
- Scale down khi CPU usage < 70%

#### c. Behavior
```yaml
behavior:
  scaleDown:
    stabilizationWindowSeconds: 300
```
- `scaleDown`: Chờ 5 phút trước khi scale down (tránh flapping)
- `scaleUp`: Scale up ngay lập tức khi cần

**Cách hoạt động:**
1. HPA check metrics mỗi 15 giây
2. Tính average CPU/Memory của tất cả pods
3. So sánh với target (70% CPU, 80% Memory)
4. Nếu > target: Tạo thêm pods (scale up)
5. Nếu < target: Xóa bớt pods (scale down)

**Formula:**
```
desiredReplicas = ceil(currentReplicas * (currentMetric / targetMetric))
```

**Ví dụ:**
- Current: 1 pod, CPU = 85%
- Target: 70%
- Desired: ceil(1 * (85/70)) = ceil(1.21) = 2 pods
- HPA sẽ tạo thêm 1 pod

### 7. `ingress.yaml` - Ingress

**Mục đích:** HTTP(S) routing từ bên ngoài vào services trong cluster.

**Các khái niệm:**

#### a. Ingress Controller
```yaml
ingressClassName: nginx
```
- NGINX Ingress Controller phải được cài đặt trong cluster
- Controller này sẽ tạo LoadBalancer/NodePort để nhận traffic

#### b. Rules
```yaml
rules:
  - host: api.lbs-dev.local
    http:
      paths:
        - path: /
          pathType: Prefix
          backend:
            service:
              name: lbs-service
              port:
                number: 80
```
- `host`: Domain name (DNS phải point đến Ingress Controller)
- `path`: URL path pattern
- `pathType: Prefix`: Match tất cả paths bắt đầu với /
- `backend`: Service để forward traffic

#### c. Annotations
```yaml
annotations:
  nginx.ingress.kubernetes.io/ssl-redirect: "false"
  nginx.ingress.kubernetes.io/enable-cors: "true"
```
- `ssl-redirect`: Tự động redirect HTTP → HTTPS
- `enable-cors`: Bật CORS cho API
- `proxy-body-size`: Giới hạn request body size

**Traffic flow:**
```
Client → DNS (api.lbs-dev.local) 
       → Ingress Controller (NGINX) 
       → Ingress Rules 
       → Service (lbs-service:80) 
       → Pods (lbs-app:3000) 
       → App
```

**Setup:**
1. Install NGINX Ingress Controller
2. Cấu hình DNS hoặc /etc/hosts
3. Deploy Ingress manifest
4. Test: `curl http://api.lbs-dev.local`

## 🔍 Troubleshooting

### Pods không start?

```bash
# Xem chi tiết pod
kubectl describe pod POD_NAME -n lbs-dev

# Xem logs của init container
kubectl logs POD_NAME -n lbs-dev -c wait-for-rds
kubectl logs POD_NAME -n lbs-dev -c wait-for-redis

# Xem logs của main container
kubectl logs POD_NAME -n lbs-dev -c app
```

### Không kết nối được RDS/Redis?

1. Check security groups cho phép traffic từ EKS
2. Check endpoints trong configmap đã đúng chưa
3. Check credentials trong secret đã đúng chưa

### Pod bị CrashLoopBackOff?

```bash
# Xem logs để biết lý do
kubectl logs POD_NAME -n lbs-dev --previous

# Kiểm tra events
kubectl get events -n lbs-dev --sort-by='.lastTimestamp'
```

## 🧹 Cleanup

```bash
# Xóa tất cả Kubernetes resources
kubectl delete -f base/

# Xóa RDS
aws rds delete-db-instance \
  --db-instance-identifier dev-lbs-mysql \
  --skip-final-snapshot

# Xóa ElastiCache
aws elasticache delete-cache-cluster \
  --cache-cluster-id dev-lbs-redis
```

## 📚 Học thêm

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [AWS EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)

---

**Chúc bạn deploy thành công! 🎉**
