import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png";
import neutral_icon from "../assets/neutral.png";
import negative_icon from "../assets/negative.png";
import review_icon from "../assets/reviewbutton.png";
import Header from "../Header/Header";

const Dealer = () => {
  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [unreviewed, setUnreviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [postReview, setPostReview] = useState(<></>);

  let curr_url = window.location.href;
  let root_url = curr_url.substring(0, curr_url.indexOf("dealer"));
  let params = useParams();
  let id = params.id;
  let dealer_url = root_url + `djangoapp/dealer/${id}`;
  let reviews_url = root_url + `djangoapp/reviews/dealer/${id}`;
  let post_review = root_url + `postreview/${id}`;

  const get_dealer = async () => {
    try {
      const res = await fetch(dealer_url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const retobj = await res.json();
      if (retobj.status === 200 && Array.isArray(retobj.dealer)) {
        setDealer(retobj.dealer[0]);
      } else {
        setError("Failed to load dealer info.");
      }
    } catch (err) {
      console.error("Error fetching dealer:", err);
      setError("Could not fetch dealer details.");
    }
  };

  const get_reviews = async () => {
    try {
      const res = await fetch(reviews_url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      let retobj;
      try {
        retobj = await res.json();
      } catch (jsonErr) {
        console.error("Invalid JSON from backend:", jsonErr);
        setError("Invalid data received from server.");
        setLoading(false);
        return;
      }

      if (retobj.status === 200) {
        if (retobj.reviews && retobj.reviews.length > 0) {
          setReviews(retobj.reviews);
        } else {
          setUnreviewed(true);
        }
      } else {
        setError("Failed to load reviews.");
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Could not fetch reviews. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const senti_icon = (sentiment) => {
    if (sentiment === "positive") return positive_icon;
    if (sentiment === "negative") return negative_icon;
    return neutral_icon;
  };

  useEffect(() => {
    get_dealer();
    get_reviews();
    if (sessionStorage.getItem("username")) {
      setPostReview(
        <a href={post_review}>
          <img
            src={review_icon}
            style={{ width: "10%", marginLeft: "10px", marginTop: "10px" }}
            alt="Post Review"
          />
        </a>
      );
    }
  }, []);

  return (
    <div style={{ margin: "20px" }}>
      <Header />
      {error ? (
        <div style={{ color: "red", marginTop: "20px" }}>{error}</div>
      ) : (
        <>
          <div style={{ marginTop: "10px" }}>
            <h1 style={{ color: "grey" }}>
              {dealer.full_name}
              {postReview}
            </h1>
            <h4 style={{ color: "grey" }}>
              {dealer["city"]}, {dealer["address"]}, Zip - {dealer["zip"]},{" "}
              {dealer["state"]}
            </h4>
          </div>
          <div className="reviews_panel">
            {loading ? (
              <p>Loading Reviews...</p>
            ) : unreviewed ? (
              <div>No reviews yet!</div>
            ) : (
              reviews.map((review, index) => (
                <div className="review_panel" key={index}>
                  <img
                    src={senti_icon(review.sentiment)}
                    className="emotion_icon"
                    alt="Sentiment"
                  />
                  <div className="review">{review.review}</div>
                  <div className="reviewer">
                    {review.name} {review.car_make} {review.car_model}{" "}
                    {review.car_year}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dealer;
