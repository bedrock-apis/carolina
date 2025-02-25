export function delay(time: number): Promise<void>{return new Promise<void>(res=>setTimeout(res, time));}
export function random64(): bigint{
    return (
        (BigInt((Math.random() * 0xffff_ffff) & 0xffff_ffff)<<32n)
        & (BigInt((Math.random() * 0xffff_ffff) & 0xffff_ffff))
    );
}