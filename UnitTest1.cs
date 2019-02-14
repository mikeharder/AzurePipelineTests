using NUnit.Framework;
using System;
using System.Net.Http;

namespace Tests
{
    public class Tests
    {
        [Test]
        public void Test1()
        {
            var version = (new HttpRequestMessage()).Version.ToString();
            var path = typeof(object).Assembly.Location;
            Assert.Fail($"Path: {path}, Version: {version}");
        }
    }
}