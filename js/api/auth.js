export async function getData() {
    const res = await fetch('http://localhost:3000', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });
    const data = await res.json();
    console.log(data);
}
