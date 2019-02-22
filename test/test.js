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

    it('sleeps 6 seconds', async function() {
        console.log('before sleeps 6 seconds');
        await delay(6000);
        console.log('after sleeps 6 seconds');
    });

    it('sleeps 7 seconds', async function() {
        console.log('before sleeps 7 seconds');
        await delay(7000);
        console.log('after sleeps 7 seconds');
    });

    it('sleeps 8 seconds', async function() {
        console.log('before sleeps 8 seconds');
        await delay(8000);
        console.log('after sleeps 8 seconds');
    });

    it('sleeps 9 seconds', async function() {
        console.log('before sleeps 9 seconds');
        await delay(9000);
        console.log('after sleeps 9 seconds');
    });
});
