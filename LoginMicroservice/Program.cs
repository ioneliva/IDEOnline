using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace LoginMicroservice
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = CreateWebHostBuilder(args);

            //rememeber server starting time
            GlobalStatistics.SetServerStart();

            builder.Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
            .ConfigureAppConfiguration(config =>
            {
                config.AddJsonFile("hosting.json", optional: false, reloadOnChange: true);
                config.AddEnvironmentVariables();
            })
            .UseStartup<Startup>();
    }
}
