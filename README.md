# defer reject

Defer rejection explicitly until a catch handler is attached.


## Install

```bash
$ npm i defer-reject
```

## Usage

```ts
import { deferReject } from 'defer-reject';

async function work1()
{
    await new Promise((_resolve, reject) => {
        setTimeout(() => {
            reject(new Error('rejected'))
        }, 1000)
    });
}

async function work2()
{
    return new Promise(resolve => setTimeout(resolve, 2000));
}

async function work()
{
    try{
        const work1_result = deferReject(work1());
        await work2();
        return await work1_result;
    }catch(e){
        console.log("Caught:", e);
    }
}

work();
```

## API
`deferReject<T>(promise: Promise<T>): Promise<T>`: defer rejection of a promise until a catch handler is attached(`awaited` or `catch(onrejected) or then(onfulfilled, onrejected) is called`).

`RejectDeferredPromise<T>`: a promise with deferred rejection. constructor is same as `Promise<T>`

## W?

After node v15.0.0, [`unhandled rejections`](https://nodejs.org/api/cli.html#--unhandled-rejectionsmode:~:text=for%20heap%20snapshots.-,%2D%2Dunhandled%2Drejections%3Dmode,-%23) will emit `unhandledRejection` events by default. If an `unhandledRejection` event is not handled, it will throw an error and exit the process.

```ts
try {
    // if this rejects before work2 is finished, the process will exit
    const p1: Promise<T> = work1();

    await work2();
    return await p1;
}
...
```

With the `deferReject()` function, rejection will be deferred until `the promise is awaited` or `catch(onrejected) or then(onfulfilled, onrejected) is called`. This will prevent the process from exiting without changing `--unhandled-rejections`.

```ts
try {
    // exception will be caught by catch block
    const p1: Promise<T> = deferReject(work1());

    await work2();
    return await p1;
}
...
```
