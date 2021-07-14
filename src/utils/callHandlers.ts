export default async function callHandlers(...handlers: Array<Promise<any>>): Promise<void> {
    const results = await Promise.allSettled(handlers);
    
    for (const result of results.filter(result => result.status === "rejected")) {
        console.log('Something went wrong:', (result as PromiseRejectedResult).reason);
    }
}
