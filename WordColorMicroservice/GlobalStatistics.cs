﻿using System;

namespace WordColorMicroservice
{
    public static class GlobalStatistics
    {
        public static DateTime serverStartDate;

        public static void SetServerStart()
        {
            serverStartDate = DateTime.Now;
        }

        public static DateTime getServerStartTime()
        {
            return serverStartDate;
        }
    }
}
