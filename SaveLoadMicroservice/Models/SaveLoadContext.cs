using Microsoft.EntityFrameworkCore;

namespace SaveLoadMicroservice.Models
{
    public partial class SaveLoadContext : DbContext
    {
        public SaveLoadContext(DbContextOptions<SaveLoadContext> options)
            : base(options)
        {
        }

        public virtual DbSet<UserFiles> UserFiles { get; set; }
        public virtual DbSet<Users> Users { get; set; }
    }
}
