export interface IManager<TRequest, TResponse> {
    handle(request: TRequest): Promise<TResponse>;
}

export interface IListManager<TRequest, TResponse> {
    list(): Promise<TResponse[]>;
}

export interface ICreateManager<TRequest, TResponse> {
    create(request: TRequest): Promise<TResponse>;
}

export interface IUpdateManager<TRequest, TResponse> {
    update(request: TRequest): Promise<TResponse>;
}

export interface IDeleteManager<TRequest> {
    delete(request: TRequest): Promise<void>;
} 