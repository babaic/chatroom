using Microsoft.EntityFrameworkCore;


namespace Chatroom.API.EF
{
    public class MyContext : DbContext
    {
        public MyContext(DbContextOptions<MyContext> x) : base(x)
        {

        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
            //optionsBuilder.UseSqlServer("Server=.;Database=probaaaa;Trusted_Connection=True;MultipleActiveResultSets=true;User ID=sa;Password=test");
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            
        }


        //public DbSet<User> User { get; set; }


    }
}
