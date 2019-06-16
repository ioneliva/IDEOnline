using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace ScaffoldingMicroservice.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class StatisticsController : Controller
    {
        [HttpGet("scafoldingPing")]
        public IActionResult GetPing()
        {
            Dictionary<string, string> responsePair = new Dictionary<string, string>
                {
                    { "serverStart", GlobalStatistics.GetServerStartTime().ToString() }
                };

            return Json(responsePair);
        }
    }
}