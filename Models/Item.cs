using Inventory.Models;

namespace PokeInventory.Models
{
    public class Item : IInventoryItem
    {
        public int Count { get; set; }

        public static explicit operator InventoryItem(Item item)
        {
            return new InventoryItem
            {
                Id = item.Id,
                Url = item.Url,
                Img = item.Img,
                Name = item.Name,
                Level = null,
                Count = item.Count
            };
        }
    }
}
