const secretKey = 'HMQxnLWaEhgZ4FUvWFb7nJisiJhBBSBrRyhmEMLryqJdpXBXYgsq0TfSFFM8NB7V'
const integrationID = '7db86fb5-92f4-4f98-b711-f212f5b98b65'
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQ1YTdjM2U5ZmRkODk0NDAyZDIxNTZkZGYzZDkxOTE1Mzg3MWMyNjYzZTc0M2U4MWI3MzFkZDI0NzJmYzYzY2Q1NTVkZmNhMjM0MzhjMDgyIn0.eyJhdWQiOiI3ZGI4NmZiNS05MmY0LTRmOTgtYjcxMS1mMjEyZjViOThiNjUiLCJqdGkiOiJkNWE3YzNlOWZkZDg5NDQwMmQyMTU2ZGRmM2Q5MTkxNTM4NzFjMjY2M2U3NDNlODFiNzMxZGQyNDcyZmM2M2NkNTU1ZGZjYTIzNDM4YzA4MiIsImlhdCI6MTcwODYyODA3NSwibmJmIjoxNzA4NjI4MDc1LCJleHAiOjE3MDk3Njk2MDAsInN1YiI6IjEwNzEzNTAyIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxNTg4MjMwLCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiZWViM2RlOGUtYzQzNS00ODFhLWEyNzEtMjk5YjRhMjNkZDY5In0.IWRyqVLfwxwVutt9ANROuQNda-OhP_Xlm680NqaKFiC_vR6PnvsOuV7V_il1nTf_deRWC8zaZOh69JDuRX_-b2DXCtS7gfsqV0oekesWxo7J3iZvlpLSMYAJOJEV4L-ZFxpMjXRPJc8EjT9loufPuoS2FFL93GCOxwOEW73MKBXym27F-1foDBCKrsDYNXIXERHuWbfEqMuB41f5d4rYMnHQFeGC0ePhPy0KpFII0dc3PaL0n6uhmpNuKunVFB4LZI5F2lQgOMsKtAZxy7OmWQBj9z6VS2YLzHs6hRt9NuC9VogZ5RQBQqw9UWzH3I0XgRxzqD6ZvqOrnfHXwfDOlg'
const apiUrl = `http://localhost:8080/https://sinplym1.amocrm.ru/api/v4/leads`;

let lastFetchTime = 0;
let limit = 2;
let page = 1;
let linksData = {};
let dealsData = [];
let isAllPaginationDisabled = false;

let isLoading = false;
const loading = document.getElementById('loading');

async function getDeals(page = 1, limit = 2) {
    loading.style.display = 'block';
    dealsBody.innerHTML = '';
    const currentTime = Date.now();
    const timeDiff = currentTime - lastFetchTime;

    if (timeDiff < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - timeDiff));
    }
    lastFetchTime = Date.now();

    let url = `${apiUrl}?page=${page}&limit=${limit}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
    try {
        const response = await fetch(url, {headers});
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data._embedded || !data._embedded.leads) {
            throw new Error('No leads found');
        }
        dealsData = data._embedded.leads;
        linksData = data._links;
        updatePagination();
        loading.style.display = 'none';
    } catch (error) {
        loading.style.display = 'none';
        console.error('Error fetching data:', error);
        throw error;
    }
}


const paginationButtons = {
    prev: document.getElementById('prevPage'),
    next: document.getElementById('nextPage'),
    first: document.getElementById('firstPage')
};

Object.entries(paginationButtons).forEach(button => {
    button[1].addEventListener('click', () => {
        sortSelect.value = 'name';
        const link = linksData[button[0]];
        if (link?.href) {
            const pageNum = new URL(link.href).searchParams.get('page');
            page = parseInt(pageNum);
            updateDeals(page, limit);
        }
    });
});

function updatePagination() {
    Object.entries(paginationButtons).forEach(([key, button]) => {
        button.disabled = isAllPaginationDisabled || !linksData[key]?.href;
    });
    paginationPage.innerHTML = page;
}

const dealsBody = document.getElementById('dealsBody');

function renderDeals(data = dealsData) {
    if (!data || data.length === 0) {
        dealsBody.innerHTML = '<tr><td colspan="5" class="text-center">Ничего не найдено</td></tr>';
        return;
    }
    dealsBody.innerHTML = '';
    data.forEach(deal => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center">${deal.id}</td>
            <td class="text-center">${deal.name}</td>
            <td class="text-center">${deal.price}</td>
            <td class="text-center">${new Date(deal.created_at * 1000).toLocaleString()}</td>
            <td class="text-center">${deal.responsible_user_id}</td>
        `;
        dealsBody.appendChild(row);
    });
}

async function updateDeals(page, limit) {
    try {
        await getDeals(page, limit);
    } catch (error) {
        console.error('Error rendering deals:', error);
        dealsBody.innerHTML = `<tr><td colspan="5" class="text-center">Ошибка! ${error}</td></tr>`;
        return
    }
    renderDeals();
}

updateDeals();

const pageSizeSelect = document.getElementById('pageSize');
pageSizeSelect.addEventListener('change', () => {
    limit = pageSizeSelect.value;
    if (limit === 'all') {
        limit = '5';
        getDealsAll();
    } else {
        updateDeals(1, limit);
    }
});

async function getDealsAll() {
    let allDeals = [];
    isAllPaginationDisabled = true;
    let counter = 1;
    await getDeals(1, limit);
    if (dealsData.length > 0) {
        allDeals = allDeals.concat(dealsData);
        while (linksData.next?.href) {
            counter++;
            await getDeals(counter, limit);
            if (dealsData.length > 0) {
                allDeals = allDeals.concat(dealsData);
            }
            renderDeals(allDeals);
        }
    }
    dealsData = allDeals;
    linksData = {};
    isAllPaginationDisabled = false;
    page = 1;
    updatePagination();
}

const sortSelect = document.getElementById('sort');
sortSelect.addEventListener('change', () => {
    if (sortSelect.value === 'name') {
        dealsData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortSelect.value === 'budget-asc') {
        dealsData.sort((a, b) => a.price - b.price);
    } else if (sortSelect.value === 'budget-desc') {
        dealsData.sort((a, b) => b.price - a.price);
    }
    renderDeals(dealsData);
});
