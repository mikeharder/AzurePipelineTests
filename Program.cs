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
            Console.WriteLine($"Path: {path}, Version: {version}");
        }
    }
}
