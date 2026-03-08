import java.util.*;
public class Application{

    String name; 
    String studentID; 
    String email;

    public Application(){
        Scanner scan = new Scanner(System.in);
        
        System.out.print("Enter your name: ");
        name = scan.nextLine();

        System.out.print("Enter your student ID: ");
        studentID = scan.nextLine();

        System.out.print("Enter your school email: ");
        email = scan.nextLine();

        scan.close();
    }






}