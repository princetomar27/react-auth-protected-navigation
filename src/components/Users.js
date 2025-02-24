import { useState, useEffect } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Users = () => {
  const [users, setUsers] = useState();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();

  useEffect(() => {
    if (!auth?.accessToken) {
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const getUsers = async () => {
      try {
        const response = await axiosPrivate.get("/users", {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });
        console.log("Users response:", response.data);
        isMounted && setUsers(response.data);
      } catch (err) {
        console.error("Error:", err);
        if (!err?.response) {
          console.error("No Server Response");
        } else if (err.response?.status === 401) {
          console.error("Unauthorized");
          navigate("/login", { state: { from: location }, replace: true });
        } else {
          console.error("Error fetching users");
        }
      }
    };

    getUsers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [axiosPrivate, location, navigate, auth]);

  return (
    <article>
      <h2>Users List</h2>
      {users?.length ? (
        <ul>
          {users.map((user, i) => (
            <li key={i}>{user?.username}</li>
          ))}
        </ul>
      ) : (
        <p>No users to display</p>
      )}
    </article>
  );
};

export default Users;
