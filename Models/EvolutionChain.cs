using Newtonsoft.Json;
using System.Collections.Generic;

namespace PokeInventory.Models
{
    public class Evolution
    {
        public string Trigger { get; set; }
        public string Item { get; set; }
        public string Level { get; set; }
        public string Pokemon { get; set; }
    }

    public class Chain
    {
        [JsonProperty("evolution_details")]
        public List<Details> EvolutionDetails { get; set; }

        [JsonProperty("evolves_to")]
        public List<Chain> EvolvesTo { get; set; }

        public Species Species { get; set; }
    }

    public class Details
    {
        [JsonProperty("min_level")]
        public string MinLevel { get; set; }

        public ChainItem Item { get; set; }

        public Trigger Trigger { get; set; }
    }

    public class ChainItem
    {
        public string Name { get; set; }
    }

    public class Trigger
    {
        public string Name { get; set; }
    }

    public class Species
    {
        public string Name { get; set; }
    }
}
