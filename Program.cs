using System;
using System.Net.Http;

namespace AzurePipelineTests
{
    class Program
    {
        static void Main(string[] args)
        {
            var version = (new HttpRequestMessage()).Version.ToString();
            var path = typeof(object).Assembly.Location;
            Assert.Fail($"Path: {path}, Version: {version}");
            Console.WriteLine($"HttpRequestMessage.Version: {(new HttpRequestMessage()).Version}");
        }
    }
}
