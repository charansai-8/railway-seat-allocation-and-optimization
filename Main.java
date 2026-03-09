import java.util.Scanner;

/*
 Railway Berth Allocation System
 DSA Concepts Used:
 Linked List  -> confirmed ticket storage
 Heap         -> waiting list priority
 Hash Table   -> PNR lookup
 Merge Sort   -> sorting confirmed tickets
*/

public class Main {
    

    static Coach coach;
    static PNRHashTable pnrTable = new PNRHashTable(101);
    static PriorityWaitingHeap waitingHeap = new PriorityWaitingHeap(50);
    static TicketLinkedList confirmedTickets = new TicketLinkedList();

    static int pnrCounter = 1000;
    static Scanner sc = new Scanner(System.in);

    public static void main(String[] args) {

        coach = new Coach("S1", "Sleeper", 8);

        System.out.println("========================================");
        System.out.println("   RAILWAY BERTH ALLOCATION SYSTEM");
        System.out.println("   DSA: LinkedList | Heap | Hash | Sort ");
        System.out.println("========================================\n");

        boolean running = true;

        while (running) {

            printMenu();

            int choice = readInt("Enter choice: ");

            switch (choice) {

                case 1:
                    bookTicket();
                    break;

                case 2:
                    cancelTicket();
                    break;

                case 3:
                    checkPNR();
                    break;

                case 4:
                    showSeatMap();
                    break;

                case 5:
                    showWaitingList();
                    break;

                case 6:
                    showConfirmedTickets();
                    break;

                case 7:
                    showStats();
                    break;

                case 0:
                    running = false;
                    break;

                default:
                    System.out.println("Invalid option\n");
            }
        }

        System.out.println("\nThank you for using Railway System!");
    }

    static void printMenu() {

        System.out.println("-------- MENU --------");
        System.out.println("1. Book Ticket");
        System.out.println("2. Cancel Ticket");
        System.out.println("3. Check PNR Status");
        System.out.println("4. View Seat Map");
        System.out.println("5. View Waiting List");
        System.out.println("6. View Confirmed Tickets");
        System.out.println("7. Utilization Stats");
        System.out.println("0. Exit");
        System.out.println("----------------------");
    }

    static void bookTicket() {

        System.out.println("\n--- BOOK TICKET ---");

        String name = readString("Passenger Name : ");
        int age = readInt("Age : ");
        String quota = readString("Quota (GN/SC/PH/LD/PT/TQ): ").toUpperCase();
        int daysAhead = readInt("Days before travel (1-120): ");

        Berth berth = coach.allocateNextAvailable();

        int pnr = ++pnrCounter;

        Ticket ticket = new Ticket(pnr, name, age, quota, daysAhead);

        if (berth != null) {

            berth.book(pnr);

            ticket.setStatus("CONFIRMED");
            ticket.setBerthInfo(berth.toString());

            confirmedTickets.insert(ticket);
            pnrTable.put(pnr, ticket);

            System.out.println("\nTicket Confirmed!");
            System.out.println("PNR : " + pnr);
            System.out.println("Berth : " + berth);

        } else {

            ticket.setStatus("WAITING");

            int priority = calcPriority(quota, age, daysAhead);

            ticket.setPriority(priority);

            waitingHeap.insert(ticket);
            pnrTable.put(pnr, ticket);

            System.out.println("\nAdded to Waiting List");
            System.out.println("PNR : " + pnr);
            System.out.println("Priority Score : " + priority);
        }

        System.out.println();
    }

    static void cancelTicket() {

        System.out.println("\n--- CANCEL TICKET ---");

        int pnr = readInt("Enter PNR to cancel: ");

        Ticket t = pnrTable.get(pnr);

        if (t == null) {

            System.out.println("PNR not found\n");
            return;
        }

        if (t.getStatus().equals("CONFIRMED")) {

            coach.freeBerth(pnr);

            confirmedTickets.remove(pnr);

            pnrTable.remove(pnr);

            System.out.println("Ticket Cancelled");

            if (!waitingHeap.isEmpty()) {

                Ticket promoted = waitingHeap.extractMax();

                Berth b = coach.allocateNextAvailable();

                if (b != null) {

                    b.book(promoted.getPnr());

                    promoted.setStatus("CONFIRMED");
                    promoted.setBerthInfo(b.toString());

                    confirmedTickets.insert(promoted);

                    System.out.println("Waiting passenger promoted!");
                    System.out.println("PNR " + promoted.getPnr() + " confirmed on " + b);
                }
            }

        } else {

            waitingHeap.remove(pnr);

            pnrTable.remove(pnr);

            System.out.println("Waiting list entry cancelled");
        }

        System.out.println();
    }

    static void checkPNR() {

        int pnr = readInt("\nEnter PNR: ");

        Ticket t = pnrTable.get(pnr);

        if (t == null)
            System.out.println("PNR not found\n");
        else
            System.out.println("\n" + t.fullDetails() + "\n");
    }

    static void showSeatMap() {

        System.out.println("\n--- SEAT MAP ---");

        coach.printMap();

        System.out.println();
    }

    static void showWaitingList() {

        System.out.println("\n--- WAITING LIST ---");

        waitingHeap.display();

        System.out.println();
    }

    static void showConfirmedTickets() {

        System.out.println("\n--- CONFIRMED TICKETS ---");

        Ticket[] arr = confirmedTickets.toArray();

        if (arr.length == 0) {

            System.out.println("No confirmed tickets\n");
            return;
        }

        MergeSort.sort(arr, 0, arr.length - 1);

        for (Ticket t : arr)
            System.out.println(t.fullDetails());

        System.out.println();
    }

    static void showStats() {

        int total = coach.totalBerths();
        int booked = coach.bookedCount();
        int waiting = waitingHeap.size();
        int available = total - booked;

        System.out.println("\n--- UTILIZATION STATS ---");

        System.out.println("Total Berths : " + total);
        System.out.println("Confirmed : " + booked);
        System.out.println("Available : " + available);
        System.out.println("Waiting : " + waiting);

        System.out.println();
    }

    static int calcPriority(String quota, int age, int daysAhead) {

        int base;

        switch (quota) {

            case "PH":
                base = 100;
                break;

            case "SC":
                base = 80;
                break;

            case "LD":
                base = 60;
                break;

            case "PT":
                base = 50;
                break;

            case "TQ":
                base = 40;
                break;

            default:
                base = 20;
        }

        int ageBonus = (age >= 60) ? 20 : 0;

        int earlyBonus = Math.max(0, 30 - daysAhead);

        return base + ageBonus + earlyBonus;
    }

    static int readInt(String prompt) {

        System.out.print(prompt);

        while (!sc.hasNextInt()) {

            sc.next();
            System.out.print(prompt);
        }

        int v = sc.nextInt();

        sc.nextLine();

        return v;
    }

    static String readString(String prompt) {

        System.out.print(prompt);

        return sc.nextLine().trim();
    }
}