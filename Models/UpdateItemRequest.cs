namespace PokeInventory.Models
{
    public class UpdateItemRequest
    {
        public int? ItemId { get; set; }
        public string Action { get; set; }
        public int? Count { get; set; }
    }
}
