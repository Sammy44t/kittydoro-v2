import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./styles.module.css";
import BASE_URL from '../../../server/config/config.js';

const Main = () => {
    const [currency, setCurrency] = useState(0); // State to store user's currency
    const [currentAvatar, setCurrentAvatar] = useState(""); // User's current avatar URL
    const [timeLeft, setTimeLeft] = useState(25 * 60); // Initial timer (25 minutes)
    const [isRunning, setIsRunning] = useState(false); // Timer running state
    const [sessionType, setSessionType] = useState("study"); // "study" or "break"
    const [sessionCount, setSessionCount] = useState(0); // Count of completed study sessions
    const [ownedCats, setOwnedCats] = useState([]); // User's owned cats
    const [isInventoryOpen, setIsInventoryOpen] = useState(false); // Inventory modal
    const [allCats] = useState([
        "defaultCat.jpg",
        "boxCat.jpg",
        "murderCat.jpg",
        "cinqueCat.png",
        "donaldCat.png",
        "leonCat1.png",
        "leonCat2.png",
        "samCat.png",
        "teresaCat.jpg",
        "kuyaCat.jpg",
        "lindsayCat1.jpg",
        "lindsayCat2.jpg",
        "lindsayCat3.jpg",
        "michaelCat.jpg",
    ]); // All available cats
    const timerRef = useRef(null); // To keep track of setInterval

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.reload();
    };

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.log("No token found");
                return;
            }

            const { data } = await axios.get(`${BASE_URL}/api/users/data`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCurrency(data.currency); // Set the currency
            setCurrentAvatar(data.currentAvatar); // Set current avatar
            setOwnedCats(data.avatars);
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    // Update currency for each completed session
    const updateCurrency = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.log("No token found");
                return;
            }

            const { data } = await axios.post(
                `${BASE_URL}/api/users/update-currency`,
                { amount: 1 },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCurrency(data.currency);
        } catch (error) {
            console.error("Failed to update currency:", error);
        }
    };

    // Start the timer
    const startTimer = () => {
        if (!isRunning) {
            setIsRunning(true);
            timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(timerRef.current);
                        setIsRunning(false);
                        handleSessionEnd();
                        return 0;
                    }
                    if (sessionType === "study" && (prevTime - 1) % 60 === 0) {
                        updateCurrency();
                        fetchUserData();
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
    };

    // Handle end of a session
    const handleSessionEnd = () => {
        if (sessionType === "study") {
            if ((sessionCount + 1) % 4 === 0) {
                setSessionType("long-break"); // After 4 study sessions, take a long break
                setTimeLeft(15 * 60); // 15-minute long break
            } else {
                setSessionType("break");
                setTimeLeft(5 * 60); // 5-minute short break
            }
            setSessionCount((prevCount) => prevCount + 1);
        } else {
            setSessionType("study");
            setTimeLeft(25 * 60); // Reset to 25 minutes for study
        }
    };

    // Stop the timer
    const stopTimer = () => {
        clearInterval(timerRef.current);
        setIsRunning(false);
    };

    // Reset the timer
    const resetTimer = () => {
        clearInterval(timerRef.current);
        setIsRunning(false);
        if (sessionType === "study") {
            if ((sessionCount + 1) % 4 === 0) {
                setTimeLeft(15 * 60); // 15-minute long break
            } else {
                setTimeLeft(5 * 60); // 5-minute short break
            }
        } else {
            setTimeLeft(25 * 60); // Reset to 25 minutes for study
        }
    };

    // Format the timer display (MM:SS)
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    // Roll Gacha for new cats
    const rollGacha = async () => {
        if (currency < 25) {
            alert("Not enough currency! Keep studying to earn more.");
            return;
        }

        const availableCats = allCats.filter((cat) => !ownedCats.includes(cat));
        if (availableCats.length === 0) {
            alert("You already own all available cats!");
            return;
        }

        const randomIndex = Math.floor(Math.random() * availableCats.length);
        const newCat = availableCats[randomIndex];

        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const { data } = await axios.post(
                `${BASE_URL}/api/users/add-cat`,
                { newCat, currencyCost: 25 },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setCurrency(data.currency); // Update currency
            setOwnedCats(data.ownedCats); // Update owned cats
            fetchUserData();
            alert(`Congratulations! You got a new cat!`);
        } catch (error) {
            console.error("Failed to roll gacha:", error);
        }
    };

    // Open inventory modal
    const openInventory = () => {
        setIsInventoryOpen(true);
    };

    // Close inventory modal
    const closeInventory = () => {
        setIsInventoryOpen(false);
    };

    // Select a cat from inventory
    const selectCat = async (cat) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const { data } = await axios.post(
                `${BASE_URL}/api/users/select-avatar`,
                { avatar: cat },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setCurrentAvatar(data.currentAvatar);
            closeInventory();
        } catch (error) {
            console.error("Failed to select avatar:", error);
        }
    };

    return (
        <div className={styles.main_container}>
            <nav className={styles.navbar}>
                <h1>kittydoro</h1>
                <div className={styles.currency_display}>
                    <span>Currency: {currency}</span>
                </div>
                <div className="right-section">
                    <button onClick={openInventory} className={styles.inventory_btn}>
                        Open Inventory
                    </button>
                    <button onClick={rollGacha} className={styles.gacha_btn}>
                        Roll Gacha (25 Currency)
                    </button>
                    <button className={styles.white_btn} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>
            <div className={styles.timer_container}>
                {currentAvatar && (
                    <img
                        src={`/assets/${currentAvatar}`}
                        alt="User Avatar"
                        className={styles.avatar_image}
                    />
                )}
                <div className={styles.timer_display}>
                    {formatTime(timeLeft)}
                </div>
                <div className={styles.timer_controls}>
                    {!isRunning ? (
                        <button className={styles.start_btn} onClick={startTimer}>
                            Start
                        </button>
                    ) : (
                        <>
                            <button className={styles.reset_btn} onClick={resetTimer}>
                                Reset
                            </button>
                            <button className={styles.stop_btn} onClick={stopTimer}>
                                Stop
                            </button>
                        </>
                    )}
                </div>
            </div>
    
            {/* Inventory Modal */}
            {isInventoryOpen && (
                <div className={styles.inventory_modal}>
                    <div className={styles.modal_content}>
                        <h2>Your Cats</h2>
                        <div className={styles.cat_list}>
                            {ownedCats.map((cat, index) => (
                                <div key={index} className={styles.cat_item}>
                                    <img
                                        src={`/assets/${cat}`}
                                        alt={cat}
                                        className={styles.cat_image}
                                    />
                                    <button
                                        className={styles.select_btn}
                                        onClick={() => selectCat(cat)}
                                    >
                                        Select
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button className={styles.close_btn} onClick={closeInventory}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Main;
