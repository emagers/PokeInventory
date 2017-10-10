using Newtonsoft.Json;
using PokeInventory.Models;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace PokeInventory.Providers
{
    public class ItemListProvider
    {
        private List<ListItem> items = new List<ListItem>();
        public ItemListProvider()
        {
            string json;
            using (var filestream = new FileStream(Directory.GetCurrentDirectory() + "/wwwroot/resources/itemlist.json", FileMode.Open, FileAccess.Read))
            {
                using (var sr = new StreamReader(filestream, Encoding.UTF8))
                {
                    json = sr.ReadToEnd();
                }
            }

            items = JsonConvert.DeserializeObject<List<ListItem>>(json);
        }

        public List<ListItem> GetList()
        {
            return items;
        }
    }
}
