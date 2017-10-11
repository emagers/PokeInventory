using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

namespace PokeInventory
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .UseUrls("http://localhost:8000/")
                .Build();
    }
}
