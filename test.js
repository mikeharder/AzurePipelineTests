process.on('SIGINT', function (code) {
    console.log('SIGINT');
});

process.on('SIGTERM', function (code) {
    console.log('SIGTERM');
});

(async () => {
    for (var i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 1000));
        console.log(".");
    }
})();