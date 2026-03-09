public class PNRHashTable {

    private Ticket[] table;
    private int size;

    public PNRHashTable(int size) {

        this.size = size;

        table = new Ticket[size];
    }

    private int hash(int key) {

        return key % size;
    }

    public void put(int key, Ticket t) {

        int index = hash(key);

        while (table[index] != null)

            index = (index + 1) % size;

        table[index] = t;
    }

    public Ticket get(int key) {

        int index = hash(key);

        while (table[index] != null) {

            if (table[index].getPnr() == key)

                return table[index];

            index = (index + 1) % size;
        }

        return null;
    }

    public void remove(int key) {

        int index = hash(key);

        while (table[index] != null) {

            if (table[index].getPnr() == key) {

                table[index] = null;

                return;
            }

            index = (index + 1) % size;
        }
    }
}