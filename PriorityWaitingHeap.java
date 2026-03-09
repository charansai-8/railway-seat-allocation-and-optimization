public class PriorityWaitingHeap {

    private Ticket[] heap;
    private int size;

    public PriorityWaitingHeap(int capacity) {

        heap = new Ticket[capacity];
        size = 0;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    public int size() {
        return size;
    }

    public void insert(Ticket t) {

        heap[size] = t;
        int i = size;

        size++;

        while (i > 0 && heap[parent(i)].getPriority() < heap[i].getPriority()) {

            swap(i, parent(i));
            i = parent(i);
        }
    }

    public Ticket extractMax() {

        if (size == 0)
            return null;

        Ticket root = heap[0];

        heap[0] = heap[size - 1];

        size--;

        heapify(0);

        return root;
    }

    public void display() {

        for (int i = 0; i < size; i++)
            System.out.println(heap[i].getPnr() + " Priority: " + heap[i].getPriority());
    }

    public void remove(int pnr) {

        for (int i = 0; i < size; i++) {

            if (heap[i].getPnr() == pnr) {

                heap[i] = heap[size - 1];

                size--;

                heapify(i);

                return;
            }
        }
    }

    private void heapify(int i) {

        int largest = i;

        int left = 2 * i + 1;
        int right = 2 * i + 2;

        if (left < size && heap[left].getPriority() > heap[largest].getPriority())
            largest = left;

        if (right < size && heap[right].getPriority() > heap[largest].getPriority())
            largest = right;

        if (largest != i) {

            swap(i, largest);

            heapify(largest);
        }
    }

    private int parent(int i) {
        return (i - 1) / 2;
    }

    private void swap(int i, int j) {

        Ticket temp = heap[i];

        heap[i] = heap[j];

        heap[j] = temp;
    }
}