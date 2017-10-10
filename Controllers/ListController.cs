using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PokeInventory.Models;
using PokeInventory.Providers;

namespace PokeInventory.Controllers
{
    [Route("api/[controller]")]
    public class ListController : Controller
    {
        private readonly List<ListItem> items;

        public ListController(ItemListProvider provider)
        {
            items = provider.GetList();
        }

        [HttpGet]
        public IActionResult Get(string q)
        {
            OkObjectResult result;
            if (string.IsNullOrEmpty(q))
            {
                result = new OkObjectResult(items.Take(10));
            }
            else
            {
                result = new OkObjectResult(items.Where(x => x.Name.ToLower().Contains(q.ToLower())).Take(10));
            }

            return result;
        }
    }
}
