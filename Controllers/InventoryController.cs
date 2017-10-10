using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Inventory.Models;
using PokeInventory.Models;
using System.Net.Http;
using PokeInventory.Providers;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Inventory.Controllers
{
    [Route("api/[controller]")]
    public class InventoryController : Controller
    {
        private PokeApiProvider pokeProvider;
        private ItemListProvider itemProvider;
        private static int counter = 0;
        private static List<IInventoryItem> inventory = new List<IInventoryItem>();

        public InventoryController(ItemListProvider itemProvider, PokeApiProvider pokeProvider)
        {
            this.itemProvider = itemProvider;
            this.pokeProvider = pokeProvider;
        }

        // GET: /<controller>/
        [HttpGet]
        public IActionResult Get()
        {
            InventoryItem[] items = new InventoryItem[inventory.Count];
            for (int i = 0; i < inventory.Count; i++)
            {
                if (inventory[i].GetType() == typeof(Pokemon))
                    items[i] = (InventoryItem)(Pokemon)inventory[i];
                else
                    items[i] = (InventoryItem)(Item)inventory[i];
            }

            return new OkObjectResult(items);
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            IInventoryItem item = inventory.Find(x => x.Id == id);

            if (item == null)
                return new NotFoundResult();

            return new OkObjectResult(item);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody]AddItemRequest request)
        {
            //Get URL from list
            ListItem listItem = itemProvider.GetList().Where(x => x.Name == request.Name).FirstOrDefault();

            //if it's an item, and it already exists in list, add to existing item
            Item existingitem = (Item)inventory.Where(x => x.Name == listItem.Name).FirstOrDefault();
            if (listItem.Type == "Item" && existingitem != null)
            {
                existingitem.Count += request.Value;
                return Ok();
            }
            else
            {
                if (listItem != null)
                {
                    //Make call to get object info
                    string response = await pokeProvider.Get(listItem.Url);
                    JObject obj = JObject.Parse(response);

                    IInventoryItem item;
                    if (listItem.Type == "Item")
                    {
                        string description = obj["flavor_text_entries"].Where(x => (x["language"]["name"].ToString() == "en")).FirstOrDefault()["text"].ToString();
                        description = description.Replace('\n', ' ').Replace('\f', ' ');

                        item = new Item
                        {
                            Id = ++counter,
                            Name = listItem.Name,
                            Url = listItem.Url,
                            Img = obj["sprites"]["default"].ToString(),
                            Count = request.Value,
                            Description = description
                        };
                    }
                    else
                    {
                        //Item is a pokemon
                        //Need to get species
                        string speciesurl = obj["species"]["url"].ToString();
                        string name = obj["species"]["name"].ToString();
                        string species = await pokeProvider.Get(speciesurl);
                        JObject specObj = JObject.Parse(species);
                        string description = specObj["flavor_text_entries"].Where(x => (x["version"]["name"].ToString() == "yellow" && x["language"]["name"].ToString() == "en")).First()["flavor_text"].ToString();
                        description = description.Replace('\n', ' ').Replace('\f', ' ');

                        item = new Pokemon
                        {
                            Id = ++counter,
                            Name = listItem.Name,
                            Url = listItem.Url,
                            Img = obj["sprites"]["front_default"].ToString(),
                            Level = request.Value,
                            Description = description,
                            Evolution = await GetPokemonEvolution(specObj, name)
                        };
                    }

                    inventory.Add(item);

                    return Ok();
                }
                else
                {
                    return NotFound();
                }
            }
        }

        private async Task<List<Evolution>> GetPokemonEvolution(JObject speciesObj, string name)
        {
            //From species we need to get evolution chain
            string evolutionChain = speciesObj["evolution_chain"]["url"].ToString();
            evolutionChain = await pokeProvider.Get(evolutionChain);
            JObject evoObj = JObject.Parse(evolutionChain);
            Chain chain = JsonConvert.DeserializeObject<Chain>(evoObj["chain"].ToString());

            //From chain we need to find the correct name, then get evolution details
            List<Evolution> evos = new List<Evolution>();
            if (chain.Species.Name == name)
            {
                evos = PopulateEvolution(chain);
            }
            else
            {
                for (int i = 0; i < chain.EvolvesTo.Count; i++)
                {
                    Chain childChain = chain.EvolvesTo[i];
                    if (childChain.Species.Name == name)
                    {
                        evos = PopulateEvolution(childChain);
                    }
                    else
                    {
                        if (childChain.EvolvesTo.Count > 0)
                        {
                            childChain = childChain.EvolvesTo[0];
                            if (childChain.Species.Name == name)
                            {
                                evos = PopulateEvolution(childChain);
                            }
                        }
                    }
                }
            }

            return evos;
        }

        private List<Evolution> PopulateEvolution(Chain chain)
        {
            List<Evolution> evos = new List<Evolution>();
            for (int i = 0; i < chain.EvolvesTo.Count; i++)
            {
                if (itemProvider.GetList().Where(x => x.Name.ToLower() == chain.EvolvesTo[i].Species.Name.ToLower()).FirstOrDefault() != null)
                {
                    evos.Add(new Evolution
                    {
                        Trigger = chain.EvolvesTo[i].EvolutionDetails[0].Trigger.Name,
                        Item = chain.EvolvesTo[i].EvolutionDetails[0].Item != null ? chain.EvolvesTo[i].EvolutionDetails[0].Item.Name : null,
                        Level = chain.EvolvesTo[i].EvolutionDetails[0].MinLevel,
                        Pokemon = chain.EvolvesTo[i].Species.Name
                    });
                }
            }

            return evos;
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            IInventoryItem item = inventory.Find(x => x.Id == id);
            if (item == null)
                return new NotFoundResult();

            inventory.Remove(item);
            return new OkObjectResult(inventory);
        }
    }
}
