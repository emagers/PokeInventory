using Inventory.Models;
using System.Collections.Generic;

namespace PokeInventory.Models
{
    public class Pokemon : IInventoryItem
    {
        public int Level { get; set; }
        public List<Evolution> Evolution { get; set; }

        public static explicit operator InventoryItem(Pokemon poke)
        {
            return new InventoryItem
            {
                Id = poke.Id,
                Url = poke.Url,
                Img = poke.Img,
                Name = poke.Name,
                Level = poke.Level,
                Count = null
            };
        }
    }
}
