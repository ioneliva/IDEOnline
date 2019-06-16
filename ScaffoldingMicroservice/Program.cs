using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace ScaffoldingMicroservice
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var config = new ConfigurationBuilder()
                           .SetBasePath(Directory.GetCurrentDirectory())
                           .AddJsonFile("hosting.json", optional: false, reloadOnChange: true)
                           .AddJsonFile("appsettings.json")
                           .Build();

            var host = new WebHostBuilder()
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseKestrel()
                .UseConfiguration(config)
                .UseStartup<Startup>()
                .Build();

            //rememeber server starting time
            GlobalStatistics.SetServerStart();

            host.Run();
        }
    }
}
