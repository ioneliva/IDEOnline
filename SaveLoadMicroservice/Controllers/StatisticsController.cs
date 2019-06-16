using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace SaveLoadMicroservice.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class StatisticsController : Controller
    {
        [HttpGet("saveLoadPing")]
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