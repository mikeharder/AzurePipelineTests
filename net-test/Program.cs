using System;
using System.Diagnostics;
using System.Text;
using System.Threading.Tasks;
using Azure.Sdk.Tools.PerfAutomation;

namespace net_test
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var result = await Util.RunAsync("python3", "--version", ".", throwOnError: true);
            Console.WriteLine("--- Output ---");
            Console.WriteLine(result.StandardOutput);
            Console.WriteLine("--- Error ---");
            Console.WriteLine(result.StandardError);

            result = await Util.RunAsync("python3", "-m venv env-perf", ".", throwOnError: true);
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
