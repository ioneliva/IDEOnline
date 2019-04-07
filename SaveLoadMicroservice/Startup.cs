using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SaveLoadMicroservice.Models;

namespace SaveLoadMicroservice
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            //hard coded connection string. Need to replace it with dynamic one?
            var conString= "Data Source=(LocalDB)\\MSSQLLocalDB;AttachDbFilename=C:\\Users\\io\\source\\repos\\IDEOnline\\SaveLoadMicroservice\\Database\\UserFiles.mdf;Integrated Security=True";
            services.AddDbContext<SaveLoadContext>(options => options.UseSqlServer(conString));

            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseMvc();
        }
    }
}
