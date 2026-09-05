import { type TxClient } from "@/database";

export interface ServiceArgs<TInput> {
    data: TInput;
    tx?: TxClient;
  }