using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Inventory.Models;
using PokeInventory.Models;
using PokeInventory.Providers;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Http;

namespace PokeInventory.Controllers
{
    [Route("api/[controller]")]
    public class InventoryController : Controller
    {
        private Session heldSession;
        private PokeApiProvider pokeProvider;
        private ItemListProvider itemProvider;
        private int counter;
        private List<IInventoryItem> inventory;

        public InventoryController(Session session, ItemListProvider itemProvider, PokeApiProvider pokeProvider)
        {
            this.itemProvider = itemProvider;
            this.pokeProvider = pokeProvider;
        }

        private void LoadSession(Guid id)
        {
            Session.SetObjectAsJson(id, "NAME", "PokeApi");
            counter = Session.GetObjectFromJson<int>(id, "counter");
            inventory = Session.GetInventoryFromJson<List<IInventoryItem>>(id, "inventory");
        }

        private void SetSession(Guid id)
        {
            Session.SetObjectAsJson(id, "counter", counter);
            Session.SetInventoryAsJson(id, "inventory", inventory);
        }

        // GET: /<controller>/
        [HttpGet]
        public async Task<IActionResult> Get(string session)
        {
            LoadSession(Guid.Parse(session));

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
        public async Task<IActionResult> Get(int id, string session)
        {
            LoadSession(Guid.Parse(session));

            IInventoryItem item = inventory.Find(x => x.Id == id);

            if (item == null)
            {
                SetSession(Guid.Parse(session));
                return new JsonResult(new List<int>());
            }

            return new OkObjectResult(item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, string session, [FromBody]UpdateItemRequest request)
        {
            LoadSession(Guid.Parse(session));

            IInventoryItem item = inventory.Find(x => x.Id == id);
            if (item == null)
            {
                SetSession(Guid.Parse(session));
                return NotFound();
            }

            switch (request.Action)
            {
                case "delete":
                    if (item.GetType() == typeof(Item))
                    {
                        Item modItem = (Item)item;
                        if (request.Count == null || modItem.Count - request.Count.Value <= 0)
                        {
                            inventory.Remove(item);
                        }
                        else
                        {
                            modItem.Count -= request.Count.Value;
                        }
                    }
                    else
                    {
                        inventory.Remove(item);
                    }
                    break;
                case "level":
                    if (item.GetType() == typeof(Pokemon))
                    {
                        Item rarecandy = (Item)inventory.Find(x => x.Name.ToLower() == "rare candy");
                        if (rarecandy == null)
                        {
                            SetSession(Guid.Parse(session));
                            return new JsonResult(new { Error = $"No rare candies found to evolve {item.Name}" });
                        }

                        Pokemon pokemon = (Pokemon)item;
                        pokemon.Level++;

                        if (pokemon.Evolution.Count > 0)
                        {
                            if (pokemon.Evolution[0].Trigger == "level-up" && pokemon.Level >= Convert.ToInt32(pokemon.Evolution[0].Level))
                            {
                                await EvolvePokemon(pokemon);
                            }

                            rarecandy.Count -= 1;
                            if (rarecandy.Count == 0)
                            {
                                inventory.Remove(rarecandy);
                            }
                        }
                    }
                    break;
                default:
                    break;
            }

            SetSession(Guid.Parse(session));
            return new JsonResult(item);
        }

        [HttpPost]
        public async Task<IActionResult> Post(string session, [FromBody]AddItemRequest request)
        {
            LoadSession(Guid.Parse(session));

            //Get URL from list
            ListItem listItem = itemProvider.GetList().Where(x => x.Name.ToLower() == request.Name.ToLower()).FirstOrDefault();
            
            //if it's an item, and it already exists in list, add to existing item
            if (listItem != null && listItem.Type == "Item")
            {
                Item existingitem = (Item)inventory.Where(x => x.Name == listItem.Name).FirstOrDefault() ?? null;
                if (existingitem != null)
                {
                    existingitem.Count += request.Value;
                }
                else
                {
                    //Make call to get object info
                    string response = await pokeProvider.Get(listItem.Url);
                    JObject obj = JObject.Parse(response);

                    string description = obj["flavor_text_entries"].Where(x => (x["language"]["name"].ToString() == "en")).FirstOrDefault()["text"].ToString();
                    description = description.Replace('\n', ' ').Replace('\f', ' ');

                    IInventoryItem item = new Item
                    {
                        Id = ++counter,
                        Name = listItem.Name,
                        Url = listItem.Url,
                        Img = obj["sprites"]["default"].ToString(),
                        Count = request.Value,
                        Description = description
                    };

                    inventory.Add(item);
                }

                SetSession(Guid.Parse(session));
                return Ok();
            }
            else if(listItem != null)
            {
                //Make call to get object info
                string response = await pokeProvider.Get(listItem.Url);
                JObject obj = JObject.Parse(response);

                //Item is a pokemon
                //Need to get species
                string speciesurl = obj["species"]["url"].ToString();
                string name = obj["species"]["name"].ToString();
                string species = await pokeProvider.Get(speciesurl);
                JObject specObj = JObject.Parse(species);
                string description = specObj["flavor_text_entries"].Where(x => (x["version"]["name"].ToString() == "yellow" && x["language"]["name"].ToString() == "en")).First()["flavor_text"].ToString();
                description = description.Replace('\n', ' ').Replace('\f', ' ');

                Pokemon pokemon = new Pokemon
                {
                    Id = ++counter,
                    Name = listItem.Name,
                    Url = listItem.Url,
                    Img = obj["sprites"]["front_default"].ToString(),
                    Level = request.Value,
                    Description = description,
                    Evolution = await GetPokemonEvolution(specObj, name)
                };

                if (pokemon.Evolution.Count > 0 && pokemon.Evolution[0].Trigger == "level-up" && pokemon.Level >= Convert.ToInt32(pokemon.Evolution[0].Level))
                {
                    request.Name = pokemon.Evolution[0].Pokemon;
                    await Post(session, request);

                    SetSession(Guid.Parse(session));
                    return Ok();
                }

                inventory.Add(pokemon);

                SetSession(Guid.Parse(session));
                return Ok();
            }
            else
            {
                return BadRequest();
            }
        }

        private async Task EvolvePokemon(Pokemon pokemon)
        {
            if (pokemon.Evolution.Count > 0)
            {
                int index = 0;
                if (pokemon.Evolution.Count >= 2)
                {
                    //If there are multiple evolutions, choose one at random
                    Random random = new Random();
                    index = random.Next(pokemon.Evolution.Count - 1);
                }
                string evoName = pokemon.Evolution[index].Pokemon;
                ListItem listItem = itemProvider.GetList().Where(x => x.Name.ToLower() == evoName.ToLower()).FirstOrDefault();

                //Make call to get object info
                string response = await pokeProvider.Get(listItem.Url);
                JObject obj = JObject.Parse(response);

                string speciesurl = obj["species"]["url"].ToString();
                string name = obj["species"]["name"].ToString();
                string species = await pokeProvider.Get(speciesurl);
                JObject specObj = JObject.Parse(species);
                string description = specObj["flavor_text_entries"].Where(x => (x["version"]["name"].ToString() == "yellow" && x["language"]["name"].ToString() == "en")).First()["flavor_text"].ToString();
                description = description.Replace('\n', ' ').Replace('\f', ' ');

                List<Evolution> evos = await GetPokemonEvolution(specObj, name);

                pokemon.Name = listItem.Name;
                pokemon.Url = listItem.Url;
                pokemon.Img = obj["sprites"]["front_default"].ToString();
                pokemon.Description = description;
                pokemon.Evolution = await GetPokemonEvolution(specObj, name);
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
        public async Task<IActionResult> Delete(int id, string session)
        {
            LoadSession(Guid.Parse(session));

            IInventoryItem item = inventory.Find(x => x.Id == id);
            if (item == null)
            {
                return new NotFoundResult();
            }

            inventory.Remove(item);
            SetSession(Guid.Parse(session));
            return new OkObjectResult(inventory);
        }
    }
}
