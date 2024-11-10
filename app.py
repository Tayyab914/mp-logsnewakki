import requests
import streamlit as st

# Streamlit UI setup
def main():
    st.title("Security Testing Interface")
    if st.button("Execute Tests"):
        execute_tests()

# Function to handle all tests
def execute_tests():
    # Test 1: Login
    login_response = login()
    if login_response.ok:
        token = login_response.json().get('token')

        # Test 2: Get products with token
        products_response = get_products(token)
        st.write("Products Response:", products_response.json())

        # Test 3: Place an order
        order_response = place_order(token)
        st.write("Order Response:", order_response.json())

        # Test 4: Brute Force Login
        brute_force_login()

        # Test 5: Search Users
        users_response = search_users()
        st.write("Users Search Response:", users_response.json())

# Login function
def login():
    url = "http://localhost:5004/login"
    data = {
        "username": "akki1",
        "password": "123eerdtfgvbhnjkm,ldfgbhnjimko,lpdrfgtbhnjmk,l.;edrftgybhnjmkvb nm,dcfvbghnjmkxdcfgvbhnjkmedrtfgyhuijkodcfvgbhnjkxxdcfvgbhnjdcfvgbnhjmdccfvgbhnjctfvgybhnjkcdfv bndctfgvbhnj mcfvb nm,sdefrgthyjukilosdrtfvgybhnjmdrtfgybnhujmsdefrgthynjmkfrgthynjmk,ldcfvgbhnjmkfrgthyjk74147524526341520dcfvgbhnjmkl"
    }
    return requests.post(url, json=data)

# Get products function
def get_products(token):
    headers = {'Authorization': f'Bearer {token}'}
    url = "http://localhost:5001/products?search=<script>alert('attack')</script>"
    return requests.get(url, headers=headers)

# Place an order function
def place_order(token):
    url = "http://localhost:5002/order"
    headers = {'Authorization': f'Bearer {token}'}
    data = {
        "items": [
            {"productId": "12345", "name": "Wireless Mouse", "quantity": 2, "price": 15.99},
            {"productId": "67890", "name": "USB-C Cable", "quantity": 1, "price": 9.99}
        ],
        "totalAmount": 41.97
    }
    return requests.put(url, json=data, headers=headers)

# Brute Force Login function
def brute_force_login():
    url = "http://localhost:5004/login"
    passwords = ["password1", "password2", ..., "password20"]  # Add real passwords here
    for password in passwords:
        response = requests.post(url, json={"username": "akki1", "password": password})
        if response.ok:
            st.write("Brute-force successful:", password)
            break
        else:
            st.write("Failed attempt with:", password)

# Search Users function
def search_users():
    url = "http://localhost:5004/users/search?search={}"
    return requests.get(url)

if __name__ == "__main__":
    main()
