type Executor<T> = (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void

export class RejectDeferredPromise<T> extends Promise<T> {
    #unlock: () => void;

    static get [Symbol.species]() {
        return Promise;
    }

    constructor(executor: Executor<T>) {
        let unlock = () => {};
        super((resolve, reject) => {
            const lock = new Promise<void>((resolve) => {
                unlock = resolve;
            });

            let pending = true;
            executor((value: T | PromiseLike<T>) => {
                if (pending) {
                    pending = false;
                    resolve(value);
                }
            }, (reason?: any) => {
                if (pending) {
                    pending = false;
                    void lock.then(() => reject(reason));
                }
            });
        });
        this.#unlock = unlock;
    }

    then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined,
    ): Promise<TResult1 | TResult2> {
        if (onrejected !== undefined) {
            this.#unlock();
        }

        return super.then(onfulfilled, onrejected);
    }

    catch<TResult = never>(
        onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined,
    ): Promise<T | TResult> {
        this.#unlock();
        return super.catch(onrejected);
    }
}

export function deferReject<T>(promise: Promise<T>): Promise<T> {
    return new RejectDeferredPromise((resolve, reject) => {
        promise.then(resolve).catch(reject);
    });
}
