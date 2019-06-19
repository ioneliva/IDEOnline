using System;

namespace ColoringRepairsMicroservice
{
    public static class GlobalStatistics
    {
        public static DateTime serverStartDate;

        public static void SetServerStart()
        {
            serverStartDate = DateTime.Now;
        }

        public static DateTime GetServerStartTime()
        {
            return serverStartDate;
        }
    }
}
