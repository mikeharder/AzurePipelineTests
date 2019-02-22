using System;
using System.Threading;

namespace AzurePipelineTests
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("before");
            Thread.Sleep(30 * 1000);
            Console.WriteLine("after");
        }
    }
}
