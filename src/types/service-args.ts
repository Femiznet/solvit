import { type TxClient } from "@/database";

export interface ServiceArgs<TInput> {
    input: TInput;
    tx?: TxClient;
  }