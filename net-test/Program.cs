using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Azure.Sdk.Tools.PerfAutomation;

namespace net_test
{
    class Program
    {
        private const string _env = "env-perf";
        private static readonly string _envBin = Util.IsWindows ? "scripts" : "bin";
        private static readonly string _python = Util.IsWindows ? "python" : "python3";

        static async Task Main(string[] args)
        {
            var env = _env;

            var result = await Util.RunAsync("python3", $"-m venv {env}", ".", throwOnError: true);
            Console.WriteLine("--- Output ---");
            Console.WriteLine(result.StandardOutput);
            Console.WriteLine("--- Error ---");
            Console.WriteLine(result.StandardError);

            var python = Path.Combine(env, _envBin, "python");
            var pip = Path.Combine(env, _envBin, "pip");

            result = await Util.RunAsync(pip, "--version", ".", throwOnError: true);
            Console.WriteLine("--- Output ---");
            Console.WriteLine(result.StandardOutput);
            Console.WriteLine("--- Error ---");
            Console.WriteLine(result.StandardError);

        //     var process = new Process() {
        //         StartInfo = {
        //             FileName = "python3",
        //             Arguments = "--version",
        //             RedirectStandardOutput = true,
        //             RedirectStandardError = true,
        //             UseShellExecute = false,
        //             CreateNoWindow = true,
        //         }
        //     };
            
        //     var outputBuilder = new StringBuilder();
        //     process.OutputDataReceived += (_, e) => {
        //         if (e.Data != null) {
        //             outputBuilder.AppendLine(e.Data);
        //         }
        //     };

        //     var errorBuilder = new StringBuilder();
        //     process.ErrorDataReceived += (_, e) => {
        //         if (e.Data != null) {
        //             errorBuilder.AppendLine(e.Data);
        //         }
        //     };

        //     process.Start();

        //     process.BeginOutputReadLine();
        //     process.BeginErrorReadLine();

        //     process.WaitForExit();

        //     Console.WriteLine("--- Output ---");
        //     Console.WriteLine(outputBuilder.ToString());
        //     Console.WriteLine("--- Error ---");
        //     Console.WriteLine(errorBuilder.ToString());

        //     Console.WriteLine("done");
        }
    }
}
