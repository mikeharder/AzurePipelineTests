using System;
using System.Net.Http;

namespace AzurePipelineTests
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine($"HttpRequestMessage.Version: {(new HttpRequestMessage()).Version}");
        }
    }
}
