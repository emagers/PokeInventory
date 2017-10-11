using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;

namespace PokeInventory.Models
{
    public class Session
    {
        private static Dictionary<Guid, Dictionary<string, string>> session = new Dictionary<Guid, Dictionary<string, string>>();
        private static void AddId(Guid id)
        {
            Dictionary<string, string> dict;
            if (!session.TryGetValue(id, out dict))
            {
                session.Add(id, new Dictionary<string, string>());
            }
        }

        public static void SetObjectAsJson(Guid id, string key, object value)
        {
            AddId(id);
            session[id][key] = JsonConvert.SerializeObject(value);
        }

        public static T GetObjectFromJson<T>(Guid id, string key)
        {
            AddId(id);
            Dictionary<string, string> dict = session[id];
            string value;
            dict.TryGetValue(key, out value);

            return value == null ? default(T) : JsonConvert.DeserializeObject<T>(value);
        }

        public static void SetInventoryAsJson(Guid id, string key, object value)
        {
            AddId(id);
            session[id][key] = "{\"a\":" + JsonConvert.SerializeObject(value) + "}";
        }

        public static List<IInventoryItem> GetInventoryFromJson<T>(Guid id, string key)
        {
            AddId(id);
            Dictionary<string, string> dict = session[id];
            string value;
            dict.TryGetValue(key, out value);

            List<IInventoryItem> items = new List<IInventoryItem>();
            if (!string.IsNullOrEmpty(value))
            {
                JObject obj = JObject.Parse(value);
                JArray array = (JArray)obj["a"];
                foreach (var a in array)
                {
                    if (a["Level"] == null)
                    {
                        items.Add(a.ToObject<Item>());
                    }
                    else
                    {
                        items.Add(a.ToObject<Pokemon>());
                    }
                }
            }

            return items;
        }
    }
}
