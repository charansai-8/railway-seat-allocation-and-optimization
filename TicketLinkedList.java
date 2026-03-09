public class TicketLinkedList {

    class Node {

        Ticket data;
        Node next;

        Node(Ticket data) {
            this.data = data;
        }
    }

    Node head;

    public void insert(Ticket t) {

        Node n = new Node(t);

        n.next = head;
        head = n;
    }

    public void remove(int pnr) {

        Node prev = null;
        Node curr = head;

        while (curr != null) {

            if (curr.data.getPnr() == pnr) {

                if (prev == null)
                    head = curr.next;
                else
                    prev.next = curr.next;

                return;
            }

            prev = curr;
            curr = curr.next;
        }
    }

    public Ticket[] toArray() {

        int size = 0;

        Node temp = head;

        while (temp != null) {
            size++;
            temp = temp.next;
        }

        Ticket[] arr = new Ticket[size];

        temp = head;

        for (int i = 0; i < size; i++) {
            arr[i] = temp.data;
            temp = temp.next;
        }

        return arr;
    }
}