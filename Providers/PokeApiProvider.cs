using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace PokeInventory.Providers
{
    public class PokeApiProvider
    {
        public static Dictionary<string, string> Responses = new Dictionary<string, string>();
        private readonly HttpClient httpClient = new HttpClient();

        public PokeApiProvider()
        {

        }

        public async Task<string> Get(string url)
        {
            string response;

            //If we have already cached the response from the provided URL, return cached response
            if (!Responses.TryGetValue(url, out response))
            {
                using (var httpResponse = await httpClient.GetAsync(url))
                {
                    httpResponse.EnsureSuccessStatusCode();
                    response = await httpResponse.Content.ReadAsStringAsync();
                    Responses.Add(url, response);
                }
            }

            return response;
        }
    }
}
