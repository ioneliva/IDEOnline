using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Nancy.Owin;

namespace WordColorMicroservice
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors();   
        }
        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app)
        {
            //Cross Origin Resource Sharing (CORS) doesn't allow different domanain adresses to communicate. Security reasons on all modern browsers (IE>9 for example).
            //Like null(on disk)---> http://localhost:5001(server)
            //because we are posting "non-simple data" like json. Text is allowed for instance
            //we add an exception for disk stored web pages
            app.UseCors(builder => builder.WithOrigins("null")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
           );
           
            app.UseOwin(x => x.UseNancy(opt => opt.Bootstrapper = new CustomBootstrapper()));
        }
    }
}