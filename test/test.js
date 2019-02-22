function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Test', function () {
    this.timeout(10000);

    it('sleeps 1 seconds', async function() {
        console.log('before sleeps 1 seconds');
        await delay(1000);
        console.log('after sleeps 1 seconds');
    });

    it('sleeps 2 seconds', async function() {
        console.log('before sleeps 2 seconds');
        await delay(2000);
        console.log('after sleeps 2 seconds');
    });

    it('sleeps 3 seconds', async function() {
        console.log('before sleeps 3 seconds');
        await delay(3000);
        console.log('after sleeps 3 seconds');
    });

    it('sleeps 4 seconds', async function() {
        console.log('before sleeps 4 seconds');
        await delay(4000);
        console.log('after sleeps 4 seconds');
    });

    it('sleeps 5 seconds', async function() {
        console.log('before sleeps 5 seconds');
        await delay(5000);
        console.log('after sleeps 5 seconds');
    });
});
