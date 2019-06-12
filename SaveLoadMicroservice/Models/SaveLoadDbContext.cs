using Microsoft.EntityFrameworkCore;

namespace SaveLoadMicroservice.Models
{
    public partial class SaveLoadDbContext : DbContext
    {
        public SaveLoadDbContext()
        {
        }

        public SaveLoadDbContext(DbContextOptions<SaveLoadDbContext> options)
            : base(options)
        {
        }

        public virtual DbSet<ProjectFiles> ProjectFiles { get; set; }
        public virtual DbSet<Projects> Projects { get; set; }
        public virtual DbSet<Users> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("ProductVersion", "2.2.3-servicing-35854");

            modelBuilder.Entity<ProjectFiles>(entity =>
            {
                entity.Property(e => e.Id)
                    .HasColumnName("id");

                entity.Property(e => e.Content)
                    .HasColumnName("content")
                    .HasColumnType("VARCHAR")
                    .HasDefaultValueSql("\"\"");

                entity.Property(e => e.DirectParent)
                    .IsRequired()
                    .HasColumnName("directParent")
                    .HasColumnType("VARCHAR (30)");

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasColumnName("name")
                    .HasColumnType("VARCHAR (30)");

                entity.Property(e => e.ProjectId).HasColumnName("projectId");

                entity.Property(e => e.Type)
                    .HasColumnName("type")
                    .HasColumnType("VARCHAR (20)");

                entity.HasOne(d => d.Project)
                    .WithMany(p => p.ProjectFiles)
                    .HasForeignKey(d => d.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Projects>(entity =>
            {
                entity.Property(e => e.Id)
                    .HasColumnName("id");

                entity.Property(e => e.Language)
                    .HasColumnName("language")
                    .HasColumnType("VARCHAR (20)");

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasColumnName("name")
                    .HasColumnType("VARCHAR (30)");

                entity.Property(e => e.UserId).HasColumnName("userId");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Projects)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Users>(entity =>
            {
                entity.HasIndex(e => e.Name)
                    .IsUnique();

                entity.Property(e => e.Id)
                    .HasColumnName("id");

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasColumnName("name")
                    .HasColumnType("VARCHAR (20)");
            });
        }
    }
}
