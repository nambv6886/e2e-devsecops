import { ResponseMessage } from "./response.message.model";

export interface IPagedResponse {
  responseMessage: ResponseMessage;
  totalItemCount: number;
  pageIndex: number;
  pageSize: number;
}