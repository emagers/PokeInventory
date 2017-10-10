namespace Inventory.Models
{
    public class InventoryItem
    {
        public int Id { get; set; }
        public int? Count { get; set; }
        public string Url { get; set; }
        public string Img { get; set; }
        public int? Level { get; set; }
        public string Name { get; set; }
    }
}
