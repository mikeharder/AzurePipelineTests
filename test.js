process.once('SIGINT', function (code) {
    console.log('SIGINT');
    process.exit(1);
});

process.once('SIGTERM', function (code) {
    console.log('SIGTERM');
    process.exit(1);
});

(async () => {
    for (var i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 1000));
        console.log(".");
    }
})();
